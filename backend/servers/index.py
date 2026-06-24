"""Серверы: список ключей пользователя, трафик, сессии."""
import json
import os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
}


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
        # GET /keys?user_id=X — ключи пользователя
        if method == 'GET' and path.endswith('/keys'):
            user_id = params.get('user_id')
            cur.execute(
                "SELECT id, server_city, server_flag, vless_key, ping, load_percent, is_active FROM server_keys WHERE user_id = %s ORDER BY ping ASC",
                (user_id,)
            )
            rows = cur.fetchall()
            keys = [{'id': r[0], 'city': r[1], 'flag': r[2], 'vless': r[3], 'ping': r[4], 'load': r[5], 'active': r[6]} for r in rows]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'servers': keys})}

        # POST /keys — добавить ключ (admin)
        if method == 'POST' and path.endswith('/keys'):
            user_id = body.get('user_id')
            city = body.get('city')
            flag = body.get('flag', '🌐')
            vless = body.get('vless_key')
            ping = body.get('ping', 0)
            load = body.get('load', 0)

            if not user_id or not city or not vless:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужны user_id, city, vless_key'})}

            cur.execute(
                "INSERT INTO server_keys (user_id, server_city, server_flag, vless_key, ping, load_percent) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                (user_id, city, flag, vless, ping, load)
            )
            key_id = cur.fetchone()[0]
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'key_id': key_id})}

        # GET /traffic?user_id=X — трафик пользователя
        if method == 'GET' and path.endswith('/traffic'):
            user_id = params.get('user_id')
            cur.execute(
                "SELECT SUM(bytes_used), MAX(bytes_limit) FROM traffic_logs WHERE user_id = %s",
                (user_id,)
            )
            row = cur.fetchone()
            used = row[0] or 0
            limit = row[1] or 0
            used_gb = round(used / (1024**3), 2)
            limit_gb = round(limit / (1024**3), 2) if limit > 0 else None
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({
                'bytes_used': used, 'bytes_limit': limit,
                'used_gb': used_gb, 'limit_gb': limit_gb
            })}

        # POST /traffic — записать трафик
        if method == 'POST' and path.endswith('/traffic'):
            user_id = body.get('user_id')
            bytes_used = body.get('bytes_used', 0)
            bytes_limit = body.get('bytes_limit', 0)
            server_city = body.get('server_city', '')
            cur.execute(
                "INSERT INTO traffic_logs (user_id, bytes_used, bytes_limit, server_city) VALUES (%s, %s, %s, %s)",
                (user_id, bytes_used, bytes_limit, server_city)
            )
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}

    finally:
        cur.close()
        conn.close()
