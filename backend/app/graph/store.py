from app.graph.mock_driver import MockInMemoryGraphDriver

# Keep the mock graph consistent across all API routers in one process.
graph_driver = MockInMemoryGraphDriver()
