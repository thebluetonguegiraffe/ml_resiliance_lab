from pydantic import ValidationError


def parse_validation_error(e: ValidationError) -> list[dict]:
    return [
        {
            "field": " -> ".join(str(loc) for loc in err["loc"]),
            "error_type": err["type"],
            "message": err["msg"].removeprefix("Value error, "),
            "input": err.get("input"),
        }
        for err in e.errors()
    ]
