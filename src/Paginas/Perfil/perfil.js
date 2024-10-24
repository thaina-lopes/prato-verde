import { IoIosArrowDropleft, IoIosShareAlt } from "react-icons/io";
import { RxExit } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

import styles from "../Perfil/perfil.module.css";
import avatar from "../../imagens/profile.png";
import { MdFavorite } from "react-icons/md";

export default function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [favoritas, setFavoritas] = useState([]);
  const [copiado, setCopiado] = useState(null);

  const voltarClick = () => {
    navigate("/home");
  };

  const sairClick = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("favoritas");
    navigate("/");
  };

  useEffect(() => {
    const usuarioArmazenado = localStorage.getItem("user");
    if (usuarioArmazenado) {
      setUsuario(usuarioArmazenado);
    }
  }, []);

  useEffect(() => {
    const favoritesIds = JSON.parse(localStorage.getItem("favoritas")) || [];
    const fetchFavorites = async () => {
      const fetchedFavorites = await Promise.all(
        favoritesIds.map(async (id) => {
          const receitaRef = doc(db, "receitas", id); // Referência para o documento
          const receitaSnap = await getDoc(receitaRef); // Obtém o documento

          return { id: receitaSnap.id, ...receitaSnap.data() }; // Retorna os dados
        })
      );
      setFavoritas(fetchedFavorites);
    };
    fetchFavorites();
  }, []);

  const removerFavorita = (id) => {
    const novasFavoritas = favoritas.filter((receita) => receita.id !== id);
    setFavoritas(novasFavoritas);

    const favoritasIds = novasFavoritas.map((receita) => receita.id);
    localStorage.setItem("favoritas", JSON.stringify(favoritasIds));
  };

  const handleRecipeClick = (id) => {
    navigate(`/receitas/${id}`);
  };

  // Função para copiar o link da receita
  const copiarLinkReceita = (id) => {
    const link = `${window.location.origin}/receitas/${id}`; // Monta o link completo da receita
    navigator.clipboard.writeText(link).then(() => {
      setCopiado(id); // Marca que o link foi copiado para esta receita
      setTimeout(() => setCopiado(null), 3000); // Remove o estado de copiado após 3 seg
    });
  };

  return (
    <div className={styles.perfil}>
      <button className={styles.voltar} onClick={voltarClick}>
        <IoIosArrowDropleft size={24} />
      </button>
      <div className={styles.usuarioContainer}>
        <p className={styles.usuario}>
          <img src={avatar} alt="Ícone de perfil" className={styles.avatar} />
          {usuario}
        </p>
      </div>
      <h3 className={styles.receitasTitulo}>Receitas favoritas</h3>
      <div className={styles.cardContainer}>
        {favoritas.map((receita) => (
          <div
            key={receita.id}
            className={styles.receitaFavorita}
            onClick={() => handleRecipeClick(receita.id)}
          >
            {/* Renderize os detalhes da receita aqui */}
            <img
              src={receita.imagem}
              alt={receita.titulo}
              className={styles.imagem}
            />
            <div className={styles.containerTitulo}>
              <h4 className={styles.titulo}>{receita.titulo}</h4>
              {/* ... outros detalhes */}
              <div className={styles.icones}>
                <MdFavorite
                  onClick={(e) => {
                    e.stopPropagation(); // Impede o clique de ir para a receita
                    removerFavorita(receita.id);
                  }}
                  className={styles.iconeFavorito}
                />
                <IoIosShareAlt
                  onClick={(e) => {
                    e.stopPropagation(); // Impede o clique de ir para a receita
                    copiarLinkReceita(receita.id);
                  }}
                  className={`${styles.iconeCompartilhar} ${
                    copiado === receita.id ? styles.iconeCopiado : ""
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.sairContainer}>
        <button className={styles.sair} onClick={sairClick}>
          Sair <RxExit />
        </button>
      </div>
    </div>
  );
}
