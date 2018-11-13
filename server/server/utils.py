from typing import Dict, List, Callable, Any
import logging
import trafaret as T  # type: ignore


TRAFARET = T.Dict({
    T.Key('postgres'):
        T.Dict({
            'database': T.String(),
            'user': T.String(),
            'password': T.String(),
            'host': T.String(),
            'port': T.Int(),
            'minsize': T.Int(),
            'maxsize': T.Int(),
        }),
    T.Key('host'): T.IP,
    T.Key('port'): T.Int(),
})


def to_bool(s: str) -> bool:
    return (s.lower() in ['1', 'true', 'yes', 'y', 't'])


def parse_params(
        expected_fields: Dict[str, Callable],
        msg: Dict[str, Any],
        logger=logging
    ) -> Dict[str, Any]:
    """Parse params of WebSocket message.

    :param expected_fields: fields expected in message
    :param msg: JSON message
    :param logger: logger
    :returns: parsed message
    """
    params: Dict[str, Any] = {}

    for param, converter in expected_fields.items():
        if param not in msg:
            raise ValueError
        try:
            params[param] = converter(msg[param])
        except Exception as ex:
            text = str(ex)
            logger.info('Can\'t parse data: ' + text)
            raise ValueError(text)

    return params
