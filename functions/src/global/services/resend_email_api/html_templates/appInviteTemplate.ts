export function appInviteTemplate(name: string, siteLink: string) {
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
	<img style="height: 30rem" src="https://firebasestorage.googleapis.com/v0/b/uet-app-281cf.appspot.com/o/public%2FUET%20REV%20.300.png?alt=media&token=9758a3bf-c89d-42e1-b6ff-83f8bf0c60bd" />
	
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
	
	<div>
		<!--[if mso]>
			<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${siteLink}" style="height:40px;v-text-anchor:middle;width:200px;" arcsize="50%" stroke="f" fillcolor="#FFCD34">
	  		<w:anchorlock/>
	  		<center>
		<![endif]-->
		<a href="${siteLink}" style="background-color:#FFCD34;border-radius:20px;color:#171A1D;display:inline-block;font-family:sans-serif;font-size:13px;font-weight:bold;line-height:40px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;">Get Started</a>
		<!--[if mso]>
	  		</center>
			</v:roundrect>
  		<![endif]--></div>
	</a>
	</body>`;

	return emailTemplate;
}
