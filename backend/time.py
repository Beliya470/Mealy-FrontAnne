from datetime import datetime


timestamp = 1699213389
date_time = datetime.utcfromtimestamp(timestamp)
print(date_time.strftime('%Y-%m-%d %H:%M:%S'))
