from pathlib import Path
from dill import dumps
from koldstart import isolated, KoldstartHost, CloudKeyCredentials
import os
from isolate.connections.common import serialize_object

test_cloud = KoldstartHost(
    url=os.environ["KOLDSTART_HOST"],
    credentials=CloudKeyCredentials(
        key_id=os.environ["KOLDSTART_KEY_ID"],
        key_secret=os.environ["KOLDSTART_KEY_SECRET"],
    ),
)


def stable_diffusion():
    print("this is happening from proto update")


# @isolated(host=test_cloud)
def buff():
    print("this is happening from proto update")


path = Path(
    "/Users/gorkemyurtseven/dev/koldstart-playground/koldstart-javascript/python.dump"
).expanduser()
with open(path, "wb") as f:
    print(serialize_object("dill", buff))
    f.write(serialize_object("dill", buff))
