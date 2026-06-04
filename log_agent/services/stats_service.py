from extensions import mongo
from datetime import datetime

def get_stats(since=None, until=None):
    """Return counts by level, source, and service."""
    match_stage = {}
    if since or until:
        match_stage['timestamp'] = {}
        if since:
            match_stage['timestamp']['$gte'] = datetime.fromisoformat(since)
        if until:
            match_stage['timestamp']['$lte'] = datetime.fromisoformat(until)

    pipeline = [
        {'$match': match_stage},
        {'$facet': {
            'by_level': [{'$group': {'_id': '$level', 'count': {'$sum': 1}}}],
            'by_source': [{'$group': {'_id': '$source', 'count': {'$sum': 1}}}],
            'by_service': [{'$group': {'_id': '$service', 'count': {'$sum': 1}}}],
            'total': [{'$count': 'count'}]
        }}
    ]

    result = mongo.db.logs.aggregate(pipeline).next()
    # Format output
    return {
        'by_level': {item['_id']: item['count'] for item in result['by_level']},
        'by_source': {item['_id']: item['count'] for item in result['by_source']},
        'by_service': {item['_id']: item['count'] for item in result['by_service']},
        'total': result['total'][0]['count'] if result['total'] else 0
    }