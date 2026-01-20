import Routes from '@/router/Routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Routes />
      <ToastContainer position="top-center" toastClassName="px-4" />
    </>
  );
}

export default App;
