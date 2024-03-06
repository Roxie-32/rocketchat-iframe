import { useState, useEffect, useRef } from 'react';

const App = () => {
	// State for login form
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	// State for auth token
	const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));


	// Login user and store authToken
	const loginUser = async (e) => {
		e.preventDefault();
		if (username && password) {
			const response = await fetch(`${process.env.REACT_APP_REST_URL}/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ user: username, password }),
			});

			const data = await response.json();
			const authToken = data.data.authToken;
			setAuthToken(authToken);
			localStorage.setItem('authToken', authToken);
			window.location.reload();
		}
		setPassword('');
		setUsername('');
	};


	const iframeRef = useRef(null);

	useEffect(() => {
		const iframe = iframeRef.current;

		// Define iframe navigation
		const navigate = (path) => {
			iframe.contentWindow.postMessage({
				externalCommand: 'go',
				path,
			}, '*');
		};

		// Send the authentication request to Rocket.Chat with the users authentication token to verify if they have access to the embedded room
		const embed = async () => {
			iframe.contentWindow.postMessage({
				event: 'login-with-token',
				loginToken: authToken,
			}, '*');

			//After succesful authentication, navigate to the general channel embedded in the iframe
			navigate('/channel/general?layout=embedded');
		};

		const handleMessage = (event) => {
			if (event.data?.eventName === 'startup') {
				embed();
			}
		};

		window.addEventListener('message', handleMessage);

		return () => {
			window.removeEventListener('message', handleMessage);
		};
	}, [authToken]);



	return (
		<div className="container">
			<div className="title-section">
				<h1>Rocket.Chat Iframe</h1>
				<p>Chat Engine using Iframe</p>
			</div>
			{/* If an authToken exists, display the iframe else prompt for the login page */}
			{!authToken ? (
				<form onSubmit={loginUser} className="login-form">
					<input
						type="text"
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<button type="submit">Login</button>
				</form>
			) : (
				<div className="flex-chat-section">
					<div className="rooms">
						<h2>Embed a Rocket.Chat Room via Iframe</h2>
					<hr />
						<p>Start chatting in the general channel embedded from your Rocket.Chat workspace here.</p>
						
						
					</div>

					<div className="messages">
						{/* For iframe to work properly in other URLs, `Restric access inside any iframe` setting should be disabled. */}
						<iframe ref={iframeRef} src="http://localhost:3000/?layout=embedded" title="embedroom"></iframe>
					</div>
				</div>
			)}
		</div>
	);
};

export default App;
