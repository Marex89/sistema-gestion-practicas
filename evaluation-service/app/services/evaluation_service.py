from app.models.evaluation import ParametroEvaluacion


def calcular_nota(items: list[dict]) -> float:
    """
    items = [{"puntaje_obtenido": float, "puntaje_max": float}, ...]
    Calcula nota en escala 1.0-7.0:
        pct  = sum(puntaje_obtenido) / sum(puntaje_max)
        nota = 1.0 + pct * 6.0
    Retorna round(nota, 1), mínimo 1.0.
    """
    if not items:
        return 1.0

    total_obtenido = sum(float(item.get("puntaje_obtenido", 0)) for item in items)
    total_max = sum(float(item.get("puntaje_max", 0)) for item in items)

    if total_max == 0:
        return 1.0

    pct = total_obtenido / total_max
    nota = 1.0 + pct * 6.0
    return max(1.0, round(nota, 1))


def calcular_nota_final(
    nota_informe: float,
    nota_empleador: float,
    parametros: ParametroEvaluacion,
) -> float:
    return round(
        nota_informe * parametros.pct_informe
        + nota_empleador * parametros.pct_empleador,
        1,
    )
