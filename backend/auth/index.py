"""Регистрация, вход и управление сессией пользователя VPN-сервиса."""
import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime, timedelta

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
}


def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    salt = os.environ.get('PASSWORD_SALT', 'nebula_vpn_salt')
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    body = json.loads(event.get('body') or '{}')
    ip = event.get('requestContext', {}).get('identity', {}).get('sourceIp', '')

    conn = get_db()
    cur = conn.cursor()

    try:
        # POST /register
        if method == 'POST' and path.endswith('/register'):
            email = body.get('email', '').lower().strip()
            password = body.get('password', '')
            username = body.get('username', email.split('@')[0])

            if not email or not password or len(password) < 6:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Неверные данные'})}

            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': CORS, 'body': json.dumps({'error': 'Email уже занят'})}

            pwd_hash = hash_password(password)
            token = secrets.token_hex(32)
            cur.execute(
                "INSERT INTO users (email, password_hash, username) VALUES (%s, %s, %s) RETURNING id",
                (email, pwd_hash, username)
            )
            user_id = cur.fetchone()[0]
            conn.commit()

            cur.execute("INSERT INTO login_logs (user_id, ip_address, success) VALUES (%s, %s, TRUE)", (user_id, ip))
            conn.commit()

            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'user_id': user_id, 'email': email, 'username': username, 'token': token
            })}

        # POST /login
        if method == 'POST' and path.endswith('/login'):
            email = body.get('email', '').lower().strip()
            password = body.get('password', '')
            pwd_hash = hash_password(password)

            cur.execute(
                "SELECT id, email, username, is_active, is_admin FROM users WHERE email = %s AND password_hash = %s",
                (email, pwd_hash)
            )
            user = cur.fetchone()
            if not user:
                cur.execute(
                    "SELECT id FROM users WHERE email = %s", (email,)
                )
                uid = cur.fetchone()
                if uid:
                    cur.execute("INSERT INTO login_logs (user_id, ip_address, success) VALUES (%s, %s, FALSE)", (uid[0], ip))
                    conn.commit()
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный email или пароль'})}

            if not user[3]:
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Аккаунт заблокирован'})}

            token = secrets.token_hex(32)
            cur.execute("UPDATE users SET last_login = NOW() WHERE id = %s", (user[0],))
            cur.execute("INSERT INTO login_logs (user_id, ip_address, success) VALUES (%s, %s, TRUE)", (user[0], ip))
            conn.commit()

            # Получаем активную подписку
            cur.execute(
                "SELECT plan, status, expires_at, auto_renew FROM subscriptions WHERE user_id = %s AND status = 'active' ORDER BY expires_at DESC LIMIT 1",
                (user[0],)
            )
            sub = cur.fetchone()
            subscription = None
            if sub:
                subscription = {'plan': sub[0], 'status': sub[1], 'expires_at': sub[2].isoformat(), 'auto_renew': sub[3]}

            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'user_id': user[0], 'email': user[1], 'username': user[2],
                'is_admin': user[4], 'token': token, 'subscription': subscription
            })}

        # POST /change-password
        if method == 'POST' and path.endswith('/change-password'):
            user_id = body.get('user_id')
            old_password = body.get('old_password', '')
            new_password = body.get('new_password', '')

            if not user_id or not old_password or len(new_password) < 6:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Неверные данные'})}

            cur.execute("SELECT id FROM users WHERE id = %s AND password_hash = %s", (user_id, hash_password(old_password)))
            if not cur.fetchone():
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный текущий пароль'})}

            cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (hash_password(new_password), user_id))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        # GET /profile?user_id=X
        if method == 'GET' and path.endswith('/profile'):
            user_id = event.get('queryStringParameters', {}).get('user_id')
            cur.execute("SELECT id, email, username, created_at, last_login, two_fa_enabled FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            if not user:
                return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Не найден'})}
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'id': user[0], 'email': user[1], 'username': user[2],
                'created_at': user[3].isoformat() if user[3] else None,
                'last_login': user[4].isoformat() if user[4] else None,
                'two_fa_enabled': user[5]
            })}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
