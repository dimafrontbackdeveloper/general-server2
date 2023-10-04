const app = async () => {
	try {
		const payload = {
			token:
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjkwMTExNjIsInByb2plY3RfbmFtZSI6ImNvbnRyb2wiLCJ1c2VyX2lkIjoiNGQyZWUwMDUtYTk0Zi00ZTZmLThjODAtNjkyMmZlMWI1ZTExIiwicCI6MX0.Mj-7Ypmpyk-n9K6XIZ31yNGR_k3Yp1lcYpjnF0GkOVY',
			sheetBaseUrl:
				'https://script.google.com/macros/s/AKfycbz4qmLhX1NTUdT_IuWd_y3rK5gh-NKo1B1F0Z80M6a6xOxwYCrCQQZ6M3aCtIPmFh34/exec',
			bk: 'stake',
			startNextBotAfterTime: 15,
		}

		const res = await fetch(
			`http://localhost:5000/account?token=${payload.token}&sheetBaseUrl=${payload.sheetBaseUrl}&bk=${payload.bk}&startNextBotAfterTime=${payload.startNextBotAfterTime}&logMessage=success bet`,
			{
				method: 'GET',
			}
		)

		const data = await res.json()
		console.log(data)
	} catch (error) {
		console.log(error)
	}
}

app()
