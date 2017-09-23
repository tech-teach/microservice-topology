"""
Describes the database models.
"""
import uuid

from datetime import datetime
from pony.orm import Database, PrimaryKey, Required, Optional


TASKS = Database()


class Task(TASKS.Entity):
    """
    Describes a metrics evaluation task.
    """
    uid = PrimaryKey(str, default=lambda: uuid.uuid4().hex)
    filename = Required(str)
    status = Required(str, default='in progress')
    errors = Optional(str)
    accuracies = Optional(str)
    created = Required(datetime, default=datetime.now())
    updated = Required(datetime, default=datetime.now())
