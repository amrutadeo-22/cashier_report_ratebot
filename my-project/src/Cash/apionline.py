from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)

def get_db_connection():
    con = psycopg2.connect(
        dbname="Cash",
        user="postgres",
        host="localhost",
        port="5432",
        password="2207"
    )
    return con

@app.route('/get_entry_online', methods=['GET'])
def get_data():
    con = get_db_connection()
    cur = con.cursor()
    cur.execute("SELECT * FROM online")
    data = cur.fetchall()
    cur.close()
    con.close()
    return jsonify(data)

@app.route('/insert_entry_online', methods=['POST'])
def insert_entry():
    data = request.json
    Sr = data.get("Sr")
    ProviderOrReceiver = data.get("ProviderOrReceiver")
    Amount = data.get("Amount")
    comment = data.get("comment")
    
    con = get_db_connection()
    cur = con.cursor()
    cur.execute("""
        INSERT INTO online (Sr, ProviderOrReceiver, Amount, comment)
        VALUES (%s, %s, %s, %s) RETURNING Sr
    """, (Sr, ProviderOrReceiver, Amount, comment))
    con.commit()
    sr_id = cur.fetchone()[0]
    cur.close()
    con.close()

    return jsonify({'message': 'Entry inserted', 'Sr': sr_id}), 201

if __name__ == '__main__':
    app.run(debug=True , port='5000')
