"""Управление подписками: создание, статус, история платежей."""
import json
import os
import psycopg2
from datetime import datetime, timedelta

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
}

PLAN_PRICES = {'START': 250, 'PRO': 350, 'ULTRA': 590}


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    body = json.loads(event.get('body') or '{}')
    params = event.get('queryStringParameters') or {}

    conn = get_db()
    cur = conn.cursor()

    try:
        # GET /status?user_id=X — текущая подписка (с авто-деактивацией)
        if method == 'GET' and path.endswith('/status'):
            user_id = params.get('user_id')

            # Авто-деактивация: помечаем истёкшие подписки как expired
            cur.execute(
                "UPDATE subscriptions SET status = 'expired' WHERE user_id = %s AND status = 'active' AND expires_at < NOW()",
                (user_id,)
            )
            conn.commit()

            cur.execute(
                "SELECT id, plan, status, auto_renew, price, started_at, expires_at FROM subscriptions WHERE user_id = %s ORDER BY expires_at DESC LIMIT 1",
                (user_id,)
            )
            sub = cur.fetchone()
            if not sub:
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'subscription': None})}

            is_active = sub[2] == 'active' and sub[6] > datetime.now()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'subscription': {
                'id': sub[0], 'plan': sub[1], 'status': sub[2], 'auto_renew': sub[3],
                'price': sub[4], 'started_at': sub[5].isoformat(), 'expires_at': sub[6].isoformat(),
                'is_active': is_active
            }})}

        # POST /activate — активировать подписку после оплаты
        if method == 'POST' and path.endswith('/activate'):
            user_id = body.get('user_id')
            plan = body.get('plan', 'PRO')
            yoomoney_label = body.get('yoomoney_label', '')

            if plan not in PLAN_PRICES:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Неверный тариф'})}

            price = PLAN_PRICES[plan]
            expires_at = datetime.now() + timedelta(days=30)

            # Деактивируем старую подписку
            cur.execute("UPDATE subscriptions SET status = 'expired' WHERE user_id = %s AND status = 'active'", (user_id,))

            cur.execute(
                "INSERT INTO subscriptions (user_id, plan, status, price, expires_at, yoomoney_label) VALUES (%s, %s, 'active', %s, %s, %s) RETURNING id",
                (user_id, plan, price, expires_at, yoomoney_label)
            )
            sub_id = cur.fetchone()[0]

            cur.execute(
                "INSERT INTO payment_history (user_id, plan, amount, status, yoomoney_label) VALUES (%s, %s, %s, 'paid', %s)",
                (user_id, plan, price, yoomoney_label)
            )
            conn.commit()

            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'ok': True, 'subscription_id': sub_id, 'expires_at': expires_at.isoformat()
            })}

        # PUT /toggle-autorenew — переключить автопродление
        if method == 'PUT' and path.endswith('/toggle-autorenew'):
            user_id = body.get('user_id')
            cur.execute(
                "UPDATE subscriptions SET auto_renew = NOT auto_renew WHERE user_id = %s AND status = 'active' RETURNING auto_renew",
                (user_id,)
            )
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'auto_renew': row[0] if row else False})}

        # GET /payments?user_id=X — история платежей
        if method == 'GET' and path.endswith('/payments'):
            user_id = params.get('user_id')
            cur.execute(
                "SELECT plan, amount, status, yoomoney_label, paid_at FROM payment_history WHERE user_id = %s ORDER BY paid_at DESC LIMIT 20",
                (user_id,)
            )
            rows = cur.fetchall()
            payments = [{'plan': r[0], 'amount': r[1], 'status': r[2], 'label': r[3], 'paid_at': r[4].isoformat()} for r in rows]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'payments': payments})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()