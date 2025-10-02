from pydantic import BaseModel, Field
from typing import List

class PoseData(BaseModel):
    x: int = Field(..., description="A coordenada X da posição do elemento.")
    y: int = Field(..., description="A coordenada Y da posição do elemento.")
    rotation: int = Field(..., description="A rotação em graus do elemento.")

class Keyframe(BaseModel):
    elemento_id: str = Field(..., description="O ID do personagem ou objeto. Deve corresponder a um ID existente.")
    tipo: str = Field("personagem", description="O tipo de elemento, sempre 'personagem'.")
    tempo_frame: int = Field(0, description="O frame de tempo para este keyframe, sempre 0 para a posição inicial.")
    dados_pose: PoseData = Field(..., description="Os dados de posição e rotação do elemento.")

class KeyframeList(BaseModel):
    keyframes: List[Keyframe] = Field(..., description="Uma lista de keyframes sugeridos com base no roteiro.")

class ProcessRequest(BaseModel):
    script: str
    project_id: str # Might be useful later

class ProcessResponse(BaseModel):
    task_id: str
