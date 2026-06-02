# Manga Tracker Reading History State Fix

แก้ build error:
- Cannot find name 'setHistoryIds'
- เพิ่ม state historyIds/setHistoryIds ใน App component แล้ว
- Reading History เก็บใน localStorage แยกตาม user id
- ไม่ต้องรัน SQL ใหม่

Checks: {'state': True, 'helper': True, 'component': True}
