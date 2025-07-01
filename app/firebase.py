import firebase_admin
from firebase_admin import credentials, firestore
import os

cred = credentials.Certificate("firebase_key.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)


db_firestore = firestore.client()
