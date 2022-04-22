from dotenv import load_dotenv
import os
trelloPath = os.getcwd()
load_dotenv(trelloPath + '/.env')

apiKey = os.getenv('TRELLO_API_KEY')
apiSecret = os.getenv('TRELLO_API_SECRET')
