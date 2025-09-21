import Title from 'antd/es/typography/Title'
import { CustomButton } from '../components/Button/CustomButton'
import { myPrimaryColor } from '../utils/constants'
import { useNavigate } from 'react-router-dom'
import Paragraph from 'antd/es/typography/Paragraph'

function NotFaundPage() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <Title style={styles.title}>404</Title>
        <Paragraph style={styles.text}>
          Oops... La página que intentas buscar no pudo ser encontrada.
        </Paragraph>
        <CustomButton
          type="primary"
          size="large"
          onClick={() => navigate('/')}
          style={styles.button}
        >
          Volver al inicio
        </CustomButton>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: '1rem',
    backgroundColor: '#fafafa',
  },
  content: {
    textAlign: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: '10rem',
    marginBottom: 0,
    color: `${myPrimaryColor}`,
    fontWeight: 'bold',
    letterSpacing: '-2px',
  },
  text: {
    fontSize: '1.1rem',
    margin: '1rem 0 2rem',
    color: '#555',
  },
  button: {
    borderRadius: '8px',
    fontWeight: 500,
  },
}

export default NotFaundPage
