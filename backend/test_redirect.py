import requests, re
url = 'https://news.google.com/rss/articles/CBMitwFBVV95cUxNd0RfcTVNTDVpQXZvNGk5Y1RFNXdhSFY4dkRRNnJEbUxiTFlxWjFOOHBva0tKX2E2emZYcGZxYVRuNVk5TEx4a2N1Slh3MDZDc2pMLXpmOExaTDFDYWdxU2FuLWRHTEZ5Y3VnU1VnbEk5Y1hGbE96d0lxSWdIQlNtNEtJTzJ3cnRCQk5sN1Q5a3QtcmlRd2NtQUN6Vk43ZEdkZTBsd2ZTSDZ0M1FsSi1YTi1JRzQ4MW8?oc=5'
r = requests.get(url)
match = re.search(r'<a[^>]+href="(.*?)"', r.text)
if match:
    print(match.group(1))
else:
    print("No link found in text")
