[English](README.md) | **繁體中文**

# 🎬 Movies Watchlist 電影待看清單

以原生 HTML、CSS、JavaScript 打造的電影搜尋應用程式。透過 [OMDb API](https://www.omdbapi.com/) 搜尋任何片名、檢視完整資訊，並把喜歡的電影加入個人待看清單，資料會保存在瀏覽器中。

**[線上示範 →](https://nathanc90.github.io/movies-watchlist/)**

## 功能

- **搜尋** — 以片名搜尋上千部電影，結果分頁顯示
- **詳細資訊** — 點擊任一部電影即可看到劇情簡介、類型、片長、演員、導演與 IMDb 評分
- **待看清單** — 一鍵加入或移除；以 `localStorage` 存在本機，不需註冊帳號
- **深色模式** — 切換後的偏好會保留到下次造訪
- **響應式設計** — 從手機到桌機都好用

## 技術

純 HTML5、CSS3 與 JavaScript（ES6+）——沒有框架，也沒有建置步驟。資料來自 [OMDb API](https://www.omdbapi.com/)。

## 在本機執行

這是靜態網站，任何本機伺服器都可以：

```bash
npx serve .
```

接著開啟終端機印出的 `localhost` 網址。若要改用自己的 OMDb API key，請替換 [`shared.js`](shared.js) 開頭的 `API_KEY` 常數——免費 key 可在 [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) 立即申請。

## 專案結構

```
index.html       搜尋頁
watchlist.html   待看清單頁
shared.js        儲存、電影卡片、彈出視窗、深色模式——兩個頁面共用
index.js         搜尋與分頁
watchlist.js     待看清單渲染
styles.css       所有樣式
images/          圖示與資源
```

## 致謝

電影資料與海報由 [OMDb API](https://www.omdbapi.com/) 提供。本專案最初是為 [Scrimba](https://scrimba.com/) API 單元所做的個人專案。
