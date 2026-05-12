export default function SimpleChat() {
    const [messages, setMessages] = useState([]);
    const [mensajes, setmensajes] = useState("");


    useEffect(() => {
        const client = mqtt.connect('mqtt://broker.emqx.io');

        client.on('connect', () => {
            console.log('Conectado al broker MQTT');
            client.subscribe('icesi/tel');
        });

        client.on('message', (topic, message) => {
            setMessages(prevMessages => [...prevMessages, message.toString()]);
        });

        return () => {
            client.end();
        };
    }