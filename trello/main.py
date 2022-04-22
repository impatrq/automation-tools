# coding=utf-8
import pandas as pd
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
    lists = ['Terminado', 'Revisión', 'En proceso', 'Para hacer']
    for item in lists:
        board.add_list(item)

def createBacklog(team):
    board = createBoard('Backlog', team)
    lists = ['Bloqueado', 'Terminado', 'Sprint Backlog', 'Backlog']
    for item in lists:
        board.add_list(item)

def createPlanning(team):
    board = createBoard('Área de planificación', team)
    epics = ['HU001C', 'HU001B', 'HU001A']
    for epic in epics:
        board.add_list(epic)
    hu001 = board.add_list('HU001')
    for epic in epics:
        hu001.add_card(epic)

def importTeams():
    return pd.read_csv(trelloPath + '/teams.csv')

