function appInviteTemplate(name: string, siteLink: string) {
	const emailTemplate = `<body
	style="
		background-color: #171a1d;
		margin-top: 5rem;
		margin-bottom: 5rem;
		height: auto;
		width: auto;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
	"
	>
	<img style="height: 30rem" src="/assets/UET REV .300.png" />
	
	<p
		style="
			font-size: xx-large;
			color: white;
			font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
				Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
				sans-serif;
		"
	>
		Hi <strong>${name}</strong>
	</p>
	<p
		style="
			margin-top: -2rem;
			font-size: larger;
			color: white;
			font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
				Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
				sans-serif;
		"
	>
		You have been invited to join the UET app
	</p>
	
	<a
		href="${siteLink}"
		style="
			margin-top: 2rem;
			padding-left: 2rem;
			padding-right: 2rem;
			padding-top: 0.5rem;
			padding-bottom: 0.5rem;
			background-color: #ffcd34;
			border-radius: 1rem;
			border: 0;
			font-size: medium;
			font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
				Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
				sans-serif;
		"
	>
		Get started
	</a>
	</body>`;

	return emailTemplate;
}
