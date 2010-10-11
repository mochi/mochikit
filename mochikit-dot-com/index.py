__version__ = '1'

import os
import cgi

from google.appengine.api import urlfetch
from google.appengine.api import memcache

import feedparser
import simplejson

FEEDS = {
    'blog': "http://bob.pythonmac.org/feed/",
    'list': "http://groups.google.com/group/mochikit/feed/rss_v2_0_topics.xml",
}

def get_feeds():
    cache_key = '%s:feeds' % (__version__,)
    rval = memcache.get(cache_key)
    if rval is not None:
        return rval
    rval = _get_feeds()
    memcache.set(cache_key, rval, 300)
    return rval

def _get_feeds():
    dct = {}
    for k, v in FEEDS.iteritems():
        response = urlfetch.fetch(v)
        if response.status_code == 200:
            dct[k] = reduce_feed(k, response.content)
    return dct
        
def reduce_feed(kind, content):
    feed = feedparser.parse(content)
    lst = []
    for entry in feed['entries']:
        dct = {
            'link': entry['link'],
            'summary': entry['summary'],
            'title': entry['title'],
            'updated': '%04d-%02d-%02d' % entry['updated_parsed'][:3],
        }
        if kind == 'blog':
            for t in entry.get('tags', []):
                if t['term'].lower() == 'mochikit':
                    break
            else:
                continue
            dct['content'] = entry['content'][0]['value']
        lst.append(dct)
        if len(lst) >= 5:
            break
            
    return lst

def jsonp_wrap(data):
    jsonp = cgi.parse_qs(os.environ.get('QUERY_STRING', '')).get('jsonp')
    if not jsonp:
        return data
    return '%s(%s)' % (jsonp[0], data)
    
def main():
    data = jsonp_wrap(simplejson.dumps(get_feeds()))
    print 'Content-Type: text/plain'
    print 'Content-Length: %d' % (len(data),)
    print ''
    print data

if __name__ == '__main__':
    main()
