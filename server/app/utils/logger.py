import logging
from loguru import logger as loguru_logger

# Basic logging wrapper; in production configure handlers, formatters and rotation
logging.basicConfig(level=logging.INFO)
log = logging.getLogger('dinemate')
