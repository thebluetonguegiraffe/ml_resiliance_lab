from typing import Annotated

from bson import ObjectId
from pydantic import BeforeValidator


def to_object_id(v: any) -> ObjectId:
    return ObjectId(v)


PyObjectId = Annotated[ObjectId, BeforeValidator(to_object_id)]
