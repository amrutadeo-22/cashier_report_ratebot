
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import psycopg2
# from psycopg2 import Error
# from psycopg2.extras import RealDictCursor

# app = Flask(__name__)
# CORS(app)   

# def connect_to_db():
#     try:
#         connection = psycopg2.connect(
#             host='192.168.0.151',
#             database='hotelbookingdb',
#             user='interns',
#             password='interns2024'
#         )
#         print("Connected to database")
#         return connection
#     except Error as e:
#         print(f"Error while connecting to PostgreSQL: {e}")
#         return None


# @app.route('/get_payments', methods=['GET'])
# def get_payments():
#     connection = connect_to_db()
#     if connection:
#         try:
#             cursor = connection.cursor(cursor_factory=RealDictCursor)
#             query = """
#                 SELECT
#                     TO_CHAR(p.payment_date, 'YYYY-MM-DD') AS date,
#                     p.mode AS payment_mode,
#                     CONCAT(
#                         'Room ', p.room_id, ' - ', 
#                         g.first_name, ' ', g.last_name, ' - ',
#                         LEFT(p.description, POSITION(' ' IN p.description) - 1),
#                         ' ',
#                         SPLIT_PART(p.description, ' ', 2),
#                         ' ',
#                         SUBSTRING(p.description FROM POSITION(' ' IN p.description) + 1),
#                         ' ',
#                         p.payment_date
#                     ) AS description,
#                     '' AS reference_no,
#                     p.receipt_no AS receipt_no,
#                     '' AS company,
#                     '' AS ota_reference_no,
#                     pm.prov_inv_no AS invoice_no,
#                     CAST(NULL AS NUMERIC) AS conversion_rate,
#                     p.amount AS received,
#                     0 AS payments,
#                     p.amount AS initial_balance,
#                     SUM(p.amount) OVER (ORDER BY p.payment_date) AS balance
#                 FROM
#                     payments_pms p
#                 JOIN
#                     payments_mapping_pms pm ON p.id = pm.payment_id
#                 JOIN
#                     pms_guest_data g ON p.guest_id = g.id
#                 WHERE
#                     p.payment_date = '2024-04-06' 
#                     AND p.hotel_code = '100087'
#             """
#             cursor.execute(query)
#             payments = cursor.fetchall()
#             cursor.close()
#             connection.close()
            
             
#             payments_array = [payment_data for payment_data in payments]
            
#             return jsonify(payments_array)
#         except Error as e:
#             print(f"Error executing SQL query: {e}")
#             return jsonify({'error': 'An error occurred while executing the query'})
#     else:
#         return jsonify({'error': 'Failed to connect to the database'})


# if __name__ == '__main__':
#     app.run(debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2 import Error
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app)

def connect_to_db():
    try:
        connection = psycopg2.connect(
            host='192.168.0.151',
            database='hotelbookingdb',
            user='interns',
            password='interns2024'
        )
        print("Connected to database")
        return connection
    except Error as e:
        print(f"Error while connecting to PostgreSQL: {e}")
        return None

@app.route('/get_payments', methods=['POST'])
def get_payments():
    data = request.json
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    
    if not start_date or not end_date:
        return jsonify({'error': 'Start date and end date are required'}), 400
    
    connection = connect_to_db()
    if connection:
        try:
            cursor = connection.cursor(cursor_factory=RealDictCursor)
            query = """
                SELECT
                    TO_CHAR(p.payment_date, 'YYYY-MM-DD') AS date,
                    p.mode AS payment_mode,
                    CONCAT(
                        'Room ', p.room_id, ' - ', 
                        g.first_name, ' ', g.last_name, ' - ',
                        LEFT(p.description, POSITION(' ' IN p.description) - 1),
                        ' ',
                        SPLIT_PART(p.description, ' ', 2),
                        ' ',
                        SUBSTRING(p.description FROM POSITION(' ' IN p.description) + 1),
                        ' ',
                        p.payment_date
                    ) AS description,
                    '' AS reference_no,
                    p.receipt_no AS receipt_no,
                    '' AS company,
                    '' AS ota_reference_no,
                    pm.prov_inv_no AS invoice_no,
                    CAST(NULL AS NUMERIC) AS conversion_rate,
                    p.amount AS received,
                    0 AS payments,
                    p.amount AS initial_balance,
                    SUM(p.amount) OVER (ORDER BY p.payment_date) AS balance
                FROM
                    payments_pms p
                JOIN
                    payments_mapping_pms pm ON p.id = pm.payment_id
                JOIN
                    pms_guest_data g ON p.guest_id = g.id
                WHERE
                    p.payment_date BETWEEN %s AND %s 
                    AND p.hotel_code = '100087'
            """
            cursor.execute(query, (start_date, end_date))
            payments = cursor.fetchall()
            cursor.close()
            connection.close()
            
            payments_array = [payment_data for payment_data in payments]
            
            return jsonify(payments_array)
        except Error as e:
            print(f"Error executing SQL query: {e}")
            return jsonify({'error': 'An error occurred while executing the query'})
    else:
        return jsonify({'error': 'Failed to connect to the database'})

if __name__ == '__main__':
    app.run(debug=True)
