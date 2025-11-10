import express from "express"
import {
  addState,
  getStates,
  getSingleState,
  updateState,
  deleteState
} from "../controllers/indiaControllers.js"

const indiaRoute = express.Router()

indiaRoute.post("/", addState)
indiaRoute.get("/all", getStates)
indiaRoute.get("/:id", getSingleState)
indiaRoute.put('/:id', updateState)
indiaRoute.delete("/:id", deleteState)

export default indiaRoute