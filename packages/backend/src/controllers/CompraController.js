import { compraDTO } from "../dtos/compra/compraDTO.js";
import { comprasDeEventoDTO } from "../dtos/compra/comprasDeEventoDTO.js";
import { mensajeDTO } from "../dtos/mensaje/mensajeDTO.js";
import { parsearId } from "./parametros.js";

export class CompraController {
  constructor(compraService) {
    this.compraService = compraService;
  }

  // el body ya viene validado por el middleware validarSchema (req.validado.body)
  comprar = async (req, res) => {
    const compra = await this.compraService.comprar(
      req.usuario,
      req.validado.body,
    );
    res.status(201).json(compraDTO(compra));
  };

  listarPorComprador = async (req, res) => {
    const compras = await this.compraService.listarPorComprador(
      req.usuario,
      parsearId(req.params.id),
    );
    res.json(compras.map(compraDTO));
  };

  listarPorEvento = async (req, res) => {
    const resultado = await this.compraService.listarPorEvento(
      req.usuario,
      parsearId(req.params.id),
    );
    res.json(comprasDeEventoDTO(resultado));
  };

  obtener = async (req, res) => {
    const compra = await this.compraService.obtener(
      req.usuario,
      parsearId(req.params.id),
    );
    res.json(compraDTO(compra));
  };

  confirmar = async (req, res) => {
    const compra = await this.compraService.confirmar(
      req.usuario,
      parsearId(req.params.id),
    );
    res.json(compraDTO(compra));
  };

  utilizar = async (req, res) => {
    const compra = await this.compraService.utilizar(
      req.usuario,
      parsearId(req.params.id),
    );
    res.json(compraDTO(compra));
  };

  cancelar = async (req, res) => {
    const compra = await this.compraService.cancelar(
      req.usuario,
      parsearId(req.params.id),
    );
    res.json(compraDTO(compra));
  };

  listarMensajes = async (req, res) => {
    const mensajes = await this.compraService.listarMensajes(
      req.usuario,
      parsearId(req.params.id),
    );
    res.json(mensajes.map(mensajeDTO));
  };

  enviarMensaje = async (req, res) => {
    const mensaje = await this.compraService.enviarMensaje(
      req.usuario,
      parsearId(req.params.id),
      req.validado.body.mensaje,
    );
    res.status(201).json(mensajeDTO(mensaje));
  };
}
