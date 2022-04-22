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

def createTeam(year, course, group, name):
    organization_name = "{} 72{}{} {}".format(year, course, group, name)
    description = "Espacio de trabajo asignado al equipo {}, de 72{}{}. Año {}".format(name, course, group, year)
    nameUpdate = name.lower().replace(' ', '_')
    name= "{}_72{}{}_{}".format(year, course, group, nameUpdate)
    return client.add_organization(organization_name, description, name)

def createBoard(name, team):
    return client.add_board(board_name=name, organization_id=team.id, permission_level="public", default_lists=False)

def createKanban(team):
    board = createBoard('Kanban', team)
    board.add_list('Terminado')
    board.add_list('Revisión')
    board.add_list('En proceso')
    board.add_list('Para hacer')

