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
