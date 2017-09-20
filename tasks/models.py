import uuid

from datetime import datetime
from pony.orm import *


AccuracyScore = Database()


class Task(AccuracyScore.Entity):
    tasId = PrimaryKey(str, default=uuid.uuid4().hex)
    tasFilename = Required(str)
    tasStatus = Required(str, default='in progress')
    tasErrors = Required(str, default='[]')
    tasAccuracies = Required(str, default='{}')
    tasCreated = Required(datetime, default=datetime.now())
    tasUpdated = Required(datetime, default=datetime.now())
