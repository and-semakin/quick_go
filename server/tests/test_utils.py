import pytest

from server.utils import parse_params, to_bool


@pytest.mark.parametrize(('fields', 'data', 'expected', 'raises'), [
    ({'a': int}, {'a': 1}, {'a': 1}, False),
    ({'a': int}, {'a': '1'}, {'a': 1}, False),
    ({'a': int}, {'a': 1, 'b': 2}, {'a': 1}, False),
    ({'a': int, 'b': str}, {'a': '1', 'b': 'b'}, {'a': 1, 'b': 'b'}, False),
    ({'c': bool}, {'c': 'True'}, {'c': True}, False),
    ({'d': int}, {}, None, True),  # key not found
    ({'a': int}, {'a': 'a'}, None, True),  # cant convert 'a' to int
])
def test_parse_params(fields, data, expected, raises):
    """Check that parse_params() works as expected."""
    if not raises:
        parsed_params = parse_params(fields, data)
        assert parsed_params == expected
    else:
        with pytest.raises(ValueError):
            parse_params(fields, data)

@pytest.mark.parametrize(('raw_value', 'expected'), [
    ('1', True),
    ('True', True),
    ('true', True),
    ('TRUE', True),
    ('T', True),
    ('t', True),
    ('Yes', True),
    ('yes', True),
    ('YES', True),
    ('Y', True),
    ('y', True),
    ('0', False),
    ('qwerty', False)
])
def test_to_bool(raw_value, expected):
    """Check that to_bool() works as expected."""
    assert to_bool(raw_value) == expected
