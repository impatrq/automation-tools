from dotenv import load_dotenv
from trello import TrelloClient
import os
trelloPath = os.getcwd()
load_dotenv(trelloPath + '/.env')

apiKey = os.getenv('TRELLO_API_KEY')
apiSecret = os.getenv('TRELLO_API_SECRET')

client = TrelloClient(
    api_key=apiKey,
    api_secret=apiSecret
)
