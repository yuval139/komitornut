# הקמת מסד הנתונים (Firebase) לתורנויות

כל עוד אין חיבור, האפליקציה עובדת על המכשיר בלבד. אחרי ההקמה כל המכשירים רואים את אותם נתונים.
הכל חינמי (תוכנית Spark, בלי כרטיס אשראי), והמסד לא נמחק בגלל חוסר שימוש.

כתובת האתר בהוראות למטה: `https://yuval139.github.io/komitornut/`

## 1. פרויקט Firebase
1. נכנסים ל-console.firebase.google.com עם חשבון הגוגל שלך ולוחצים **Create a project** (או Add project).
2. שם: `komitornut`. את Google Analytics אפשר לכבות. לוחצים Create.

## 2. מסד הנתונים (Firestore)
1. בתפריט הצד: **Build ← Firestore Database ← Create database**.
2. מיקום: `eur3 (europe-west)` או כל מיקום באירופה.
3. מצב: **Production mode**. לוחצים Create.
4. נכנסים ללשונית **Rules**, מוחקים את כל מה שכתוב, מדביקים את התוכן של הקובץ `firestore.rules` (נמצא בתיקיית האתר) ולוחצים **Publish**.
   - בקובץ כתובת המייל `yuvally222@gmail.com` היא המנהל הראשון. אם אתה נכנס עם מייל אחר, צריך להחליף אותה גם בקובץ הכללים וגם ב-`config.js` (שדה `adminEmail`).

## 3. כניסה עם גוגל
1. **Build ← Authentication ← Get started ← Sign-in method ← Google**.
2. מפעילים (Enable), בוחרים מייל תמיכה (המייל שלך) ושומרים.
3. עוברים ללשונית **Settings ← Authorized domains ← Add domain** ומוסיפים: `yuval139.github.io`

## 4. אישור כתובת האתר אצל גוגל
1. נכנסים ל-console.cloud.google.com, ובוחרים למעלה את הפרויקט `komitornut`.
2. **APIs & Services ← Credentials**.
3. תחת OAuth 2.0 Client IDs פותחים את **Web client (auto created by Google Service)**.
4. ב-**Authorized redirect URIs** מוסיפים שתי כתובות (בדיוק כך, כולל הלוכסן בסוף):
   - `https://yuval139.github.io/komitornut/`
   - `https://yuval139.github.io/komitornut/index.html`
5. ב-**Authorized JavaScript origins** מוסיפים: `https://yuval139.github.io`
6. שומרים (Save). השינוי יכול לקחת כמה דקות.
7. מעתיקים את ה-**Client ID** (נראה כך: `1234567-abc.apps.googleusercontent.com`).

## 5. הנתונים שאני צריך ממך
1. **Project settings** (גלגל השיניים ליד Project Overview) ← **General** ← למטה **Your apps** ← מוסיפים אפליקציית Web (סמל `</>`), בשם כלשהו, בלי Hosting.
2. מהקוד שמוצג מעתיקים את `apiKey` ואת `projectId`.
3. שולחים לי: `apiKey`, `projectId` ו-Client ID משלב 4.

אלה לא סודות (הם גלויים בכל אתר שמשתמש ב-Firebase). ההגנה על הנתונים היא הכללים בשלב 2 וכניסת הגוגל. אל תשלח לי שום מפתח שנקרא "secret", "private key" או "service account".

## אחרי שהכל מוכן
- הכניסה הראשונה, עם המייל של המנהל, יוצרת אותך כסגן לוחמים (מנהל) עם גישה מלאה.
- כל אחד אחר שנכנס ממתין לאישור שלך בלשונית "ניהול", ואתה קובע מה הוא רואה.
- פעם אחת, כדי להעביר את הנתונים הקיימים לענן: פותחים את האפליקציה במכשיר שיש בו את כל הנתונים, ונכנסים. מה שיש במכשיר עולה לענן עם הכניסה הראשונה של המנהל.

## מה כדאי לדעת
- הנתונים בענן **לא מוצפנים** (גוגל והמנהלים של הפרויקט יכולים לראות אותם), אבל מי שאינו מאושר לא יכול לקרוא אותם. אפשר להוסיף הצפנה בהמשך.
- אין גיבוי אוטומטי. הגיבוי של האפליקציה (הגדרות ← גיבוי) עדיין עובד, ומומלץ להוריד גיבוי מדי פעם.
- כניסת גוגל מאייפון, מאפליקציה על מסך הבית, עלולה להיות פחות יציבה. אם היא נתקעת, אפשר להיכנס פעם אחת מדפדפן Safari רגיל.
