from app.config import settings
from app.graph.abstract import AbstractGraphDriver
from app.graph.mock_driver import MockInMemoryGraphDriver
from app.graph.neo4j_driver import Neo4jGraphDriver
from app.utils.logger import logger

def _init_graph_driver() -> AbstractGraphDriver:
    if settings.USE_MOCK_GRAPH:
        logger.info("Initializing shared MockInMemoryGraphDriver instance.")
        return MockInMemoryGraphDriver()
    else:
        logger.info("Initializing shared Neo4jGraphDriver instance.")
        return Neo4jGraphDriver(
            uri=settings.NEO4J_URI,
            user=settings.NEO4J_USER,
            password=settings.NEO4J_PASSWORD
        )

# Central graph driver singleton instance
graph_driver: AbstractGraphDriver = _init_graph_driver()

def get_graph_driver() -> AbstractGraphDriver:
    """Returns the shared graph driver singleton."""
    return graph_driver
