import client from 'prom-client';

const register = new client.Registry();

const OPENMETRICS_CONTENT_TYPE = 'application/openmetrics-text; version=1.0.0; charset=utf-8';
const JSONLD_CONTENT_TYPE = 'application/ld+json';

const MDG_NS = 'http://metrics.data.gift/';

function createCounter(options) {
  const metric = new client.Counter({
    name: options.name,
    help: options.help,
    labelNames: options.labelNames || [],
    registers: [register]
  });
  return metric;
}

function createGauge(options) {
  const metric = new client.Gauge({
    name: options.name,
    help: options.help,
    labelNames: options.labelNames || [],
    registers: [register]
  });
  return metric;
}

function createHistogram(options) {
  const metric = new client.Histogram({
    name: options.name,
    help: options.help,
    labelNames: options.labelNames || [],
    buckets: options.buckets,
    registers: [register]
  });
  return metric;
}

function createSummary(options) {
  const metric = new client.Summary({
    name: options.name,
    help: options.help,
    labelNames: options.labelNames || [],
    percentiles: options.percentiles,
    maxAgeSeconds: options.maxAgeSeconds,
    ageBuckets: options.ageBuckets,
    registers: [register]
  });
  return metric;
}

function registerMetric(metric) {
  register.registerMetric(metric);
}

function getMetrics() {
  return register.getMetricsAsArray();
}

function cumulativeBuckets(bucketValues, totalCount) {
  const bounds = Object.keys(bucketValues).map(Number).sort((a, b) => a - b);
  const result = [];
  let cumulative = 0;
  for (const bound of bounds) {
    cumulative += bucketValues[bound];
    result.push({ bound, value: cumulative });
  }
  result.push({ bound: Infinity, value: totalCount });
  return result;
}

function serializeJsonLD(metrics) {
  const graph = [];

  for (const family of metrics) {
    const type = family.type.charAt(0).toUpperCase() + family.type.slice(1);
    const familyNode = {
      '@type': MDG_NS + 'MetricFamily',
      [MDG_NS + 'name']: family.name,
      [MDG_NS + 'type']: { '@id': MDG_NS + type },
      [MDG_NS + 'metric']: []
    };

    if (family.help) {
      familyNode[MDG_NS + 'help'] = family.help;
    }

    const entries = Object.values(family.hashMap);

    for (const entry of entries) {
      const labels = entry.labels || {};
      const labelNodes = Object.entries(labels).map(([k, v]) => ({
        '@type': MDG_NS + 'Label',
        [MDG_NS + 'labelName']: k,
        [MDG_NS + 'labelValue']: String(v)
      }));

      const point = {
        '@type': MDG_NS + 'MetricPoint'
      };

      if (family.type === 'histogram') {
        const cumBuckets = cumulativeBuckets(entry.bucketValues || {}, entry.count);
        point[MDG_NS + 'bucket'] = cumBuckets.map(bucket => ({
          '@type': MDG_NS + 'Bucket',
          [MDG_NS + 'upperBound']: bucket.bound === Infinity ? '+Inf' : bucket.bound,
          [MDG_NS + 'count']: bucket.value
        }));
        point[MDG_NS + 'sum'] = entry.sum;
        point[MDG_NS + 'count'] = entry.count;
      } else if (family.type === 'summary') {
        const quantiles = entry.quantiles || [];
        point[MDG_NS + 'quantile'] = quantiles.map(q => ({
          '@type': MDG_NS + 'Quantile',
          [MDG_NS + 'quantile']: q.quantile,
          [MDG_NS + 'value']: q.value
        }));
        point[MDG_NS + 'sum'] = entry.sum;
        point[MDG_NS + 'count'] = entry.count;
      } else {
        point[MDG_NS + 'value'] = entry.value;
      }

      const metricNode = {
        '@type': MDG_NS + 'Metric',
        [MDG_NS + 'metricPoint']: point
      };

      if (labelNodes.length > 0) {
        metricNode[MDG_NS + 'label'] = labelNodes;
      }

      familyNode[MDG_NS + 'metric'].push(metricNode);
    }

    graph.push(familyNode);
  }

  return {
    '@context': {
      '@vocab': MDG_NS,
      xsd: 'http://www.w3.org/2001/XMLSchema#'
    },
    '@type': MDG_NS + 'MetricSet',
    '@graph': graph
  };
}

async function metricsHandler(req, res) {
  try {
    const accept = req.get('Accept') || '';

    if (accept.includes('ld+json')) {
      res.set('Content-Type', JSONLD_CONTENT_TYPE);
      res.json(serializeJsonLD(register.getMetricsAsArray()));
    } else {
      res.set('Content-Type', OPENMETRICS_CONTENT_TYPE);
      res.send(await register.metrics());
    }
  } catch (err) {
    res.status(500).end(err.message);
  }
}

export {
  createCounter,
  createGauge,
  createHistogram,
  createSummary,
  registerMetric,
  getMetrics,
  metricsHandler,
  serializeJsonLD
};

export default {
  createCounter,
  createGauge,
  createHistogram,
  createSummary,
  registerMetric,
  getMetrics,
  metricsHandler,
  serializeJsonLD
};
