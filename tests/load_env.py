"""load_env.py"""
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('API_KEY')
BASE_URL = os.getenv('BASE_URL')

username = os.getenv('DB_USERNAME')
password = os.getenv('DB_PASSWORD')
