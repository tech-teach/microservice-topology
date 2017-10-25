"""
Describes the database models.
"""
import os
import uuid

from datetime import datetime
from pony.orm import Database, PrimaryKey, Required, Optional


TASKS = Database()


class Task(TASKS.Entity):
    """
    Describes a metrics evaluation task.
    """
    uid = Required(str, default=lambda: uuid.uuid4().hex)
    filename = Required(str)
    status = Required(str, default='in progress')
    errors = Optional(str)
    accuracies = Optional(str)
    progress = Optional(float, default=0.0)
    cores = Required(int)
    canceled = Required(bool, default=False, volatile=True)
    created = Required(datetime, default=datetime.now())
    updated = Required(datetime, default=datetime.now())


TASKS.bind(
    'sqlite',
    os.path.join(os.getenv('DB_STORAGE'), 'db.sqlite'),
    create_db=True
)
TASKS.generate_mapping(create_tables=True)
