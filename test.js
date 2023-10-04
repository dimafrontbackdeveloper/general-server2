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
		const handledForksResponce = await fetch(
			`https://alg-fox.net/api/v1/bot-client/connected/71c06935977244febfaaa938d92dcce8:Y2:7fb17b9b67a242f1be6314163d8a2531/`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					authorization: `bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjkwMTExNjIsInByb2plY3RfbmFtZSI6ImNvbnRyb2wiLCJ1c2VyX2lkIjoiNGQyZWUwMDUtYTk0Zi00ZTZmLThjODAtNjkyMmZlMWI1ZTExIiwicCI6MX0.Mj-7Ypmpyk-n9K6XIZ31yNGR_k3Yp1lcYpjnF0GkOVY`,
				},
				body: JSON.stringify({
					msg_type: 'READ_HANDLED_FORK_RECORDS',
					params: {
						limit: 2,
						statuses: ['SUCCESS', 'VALUE_BET'],
					},
				}),
			}
		)
		const handledForksData = await handledForksResponce.json()
		let valueBets = handledForksData.handledForkList
		console.log(valueBets)

		const res = await fetch(
			`http://localhost:5000/account?logMessage=success bet&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjkwMTExNjIsInByb2plY3RfbmFtZSI6ImNvbnRyb2wiLCJ1c2VyX2lkIjoiNGQyZWUwMDUtYTk0Zi00ZTZmLThjODAtNjkyMmZlMWI1ZTExIiwicCI6MX0.Mj-7Ypmpyk-n9K6XIZ31yNGR_k3Yp1lcYpjnF0GkOVY&sheetBaseUrl=https://script.google.com/macros/s/AKfycbxyOj2alkPaapqJX1HZ1w0upE3TYrRMT9YZswpJlfIapOlWrSqoo5FAyTSZDM-NAsohKQ/exec&bk=stake`,
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
