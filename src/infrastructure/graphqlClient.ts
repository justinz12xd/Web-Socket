import axios from "axios";
import { config } from "../config";

//aqui deberán ir las importaciones de las entidades declaradas en domain

const client = axios.create({//esto es la coneccion con el graphql usando axios
  baseURL: config.GRAPHQL_URL,
  headers: { "Content-Type": "application/json" },
});

