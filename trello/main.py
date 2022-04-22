from dotenv import load_dotenv
import os
trelloPath = os.getcwd()
load_dotenv(trelloPath + '/.env')

apiKey = os.getenv('API_KEY')
print(apiKey)