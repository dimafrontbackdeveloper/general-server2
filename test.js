const valueBets = null

const getBets = async () => {
	const handledForksResponce = await fetch(
		`https://alg-fox.net/api/v1/bot-client/connected/${activeAccount.botUuid}/`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				authorization: `bearer ${token}`,
			},
			body: JSON.stringify({
				msg_type: 'READ_HANDLED_FORK_RECORDS',
				params: {
					limit: 3,
					statuses: ['VALUE_BET'],
				},
			}),
		}
	)
	console.log('handledForksResponce')

	const handledForksData = await handledForksResponce.json()
	console.log('handledForksData')

	valueBets = handledForksData.handledForkList
}

const postBets = async () => {
	valueBets = valueBets.reverse()
	for (let handledFork of valueBets) {
		delete handledFork.id
		delete handledFork.createdAt
		delete handledFork.updatedAt
		const res = await fetch(
			`https://alg-fox.net/api/v1/bot-client/connected/${newOrOldActiveAccount.botUuid}/`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					authorization: `bearer ${token}`,
				},
				body: JSON.stringify({
					msg_type: 'CREATE_HANDLED_FORK_RECORD',
					params: handledFork,
				}),
			}
		)
		const data = await res.json()
		console.log('data передача ставок')
		console.log(data)
	}
}

const app = async () => {
	try {
		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjkwMTExNjIsInByb2plY3RfbmFtZSI6ImNvbnRyb2wiLCJ1c2VyX2lkIjoiNGQyZWUwMDUtYTk0Zi00ZTZmLThjODAtNjkyMmZlMWI1ZTExIiwicCI6MX0.Mj-7Ypmpyk-n9K6XIZ31yNGR_k3Yp1lcYpjnF0GkOVY'
		const sheetBaseUrl =
			'https://script.google.com/macros/s/AKfycbz4qmLhX1NTUdT_IuWd_y3rK5gh-NKo1B1F0Z80M6a6xOxwYCrCQQZ6M3aCtIPmFh34/exec'

		const res = await fetch(
			`http://localhost:5000/account?logMessage=balanceLessThenZero&token=${token}&sheetBaseUrl=${sheetBaseUrl}`,
			{
				method: 'GET',
			}
		)

		const data = await res.json()
		console.log(JSON.stringify(data))
	} catch (error) {
		console.log(error)
	}
}

app()
