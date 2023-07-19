const app = async () => {
	try {
		const handledForksResponce = await fetch(
			`https://alg-fox.net/api/v1/bot-client/connected/71c06935977244febfaaa938d92dcce8:Y22:00293c274b974625b4844f4531b72326/`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					authorization: `bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjkwMTExNjIsInByb2plY3RfbmFtZSI6ImNvbnRyb2wiLCJ1c2VyX2lkIjoiNGQyZWUwMDUtYTk0Zi00ZTZmLThjODAtNjkyMmZlMWI1ZTExIiwicCI6MX0.Mj-7Ypmpyk-n9K6XIZ31yNGR_k3Yp1lcYpjnF0GkOVY`,
				},
				body: JSON.stringify({
					msg_type: 'READ_HANDLED_FORK_RECORDS',
					params: {
						limit: 5,
						statuses: ['SUCCESS', 'VALUE_BET'],
					},
				}),
			}
		)
		const handledForksData = await handledForksResponce.json()
		let valueBets = handledForksData.handledForkList
		console.log(valueBets)
	} catch (error) {
		console.log(error)
	}
}

app()
