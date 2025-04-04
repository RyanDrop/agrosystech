export const corsHeaders = (origin: string) => {
  const allowedOrigins = ['http://localhost:4200'];

  return {
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'null',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
};
