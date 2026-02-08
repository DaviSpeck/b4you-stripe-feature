import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import cities from './cities.json';

import 'react-toastify/dist/ReactToastify.css';
// minified version is also included
// import 'react-toastify/dist/ReactToastify.min.css';

function Notifications() {
  const [counter, setCounter] = useState(0);
  const names = [
    'Fernando Ferrari',
    'Marina Vivian',
    'Vinícius Palma',
    'Natielle Franck',
    'Carlos Corrêa',
    'Ricardo Conte',
    'Camila Telles',
    'Emilia Cerda',
    'Lucas André',
    'Daniel Menegasso',
    'Matheus Rossini',
    'Thiago Oliveira',
    'Bruno Fole',
    'Tiago Santos',
    'Maurício Silva',
    'Augusto Kristensen',
    'João Paes',
    'Roni Araldi',
    'Venâncio Bornemman',
    'Giancarlo Ferrari',
    'Rosina Sasse',
    'Bruna Damgaard',
    'Renan Rendon',
    'Monalise Silva',
    'Ana Vilela',
    'Rodrigo Basso',
    'Luis Felipe Krist',
    'Ícaro Lemes',
    'Guilherme Araújo',
    'Felipe Cantoni',
    'Augusto Bonvivant',
    'Allan Bida',
    'Artur Ribas',
    'Kimberly Thais',
    'Jennifer Bontase',
    'Luiz Diego',
    'Daniel Nunes',
    'Rafael Franco',
    'Andre Diamand',
    'Paul Cabannes',
    'Tallis Gomes',
    'Otavio Schmitt',
    'Yasmin Franco',
    'Mariana Bovolon',
    'Caio Morais',
    'Miro Malacrida',
    'Eduardo Borges',
    'Lucca Carniel',
    'Caroline Oliveira',
    'Renan Perrony',
    'Adriana Saty',
    'Raiane Martins',
    'Eduardo Motta',
    'Gabriela Floriani',
    'Rodrigo Vicenzi',
  ];

  const notify = () => {
    setTimeout(() => {
      let randomCity = Math.floor(Math.random() * cities.length);

      let city = cities[randomCity].nome;
      let uf = cities[randomCity].microrregiao.mesorregiao.UF.sigla;
      let name = names[Math.floor(Math.random() * names.length)];

      toast.success(`${name} de ${city} - ${uf} comprou agora.`);

      setCounter(counter + 1);

      setTimeout(() => {
        notify();
      }, 20000);
    }, 15000);
  };

  useEffect(() => {
    notify();
  }, []);

  return <></>;
}

export default Notifications;
