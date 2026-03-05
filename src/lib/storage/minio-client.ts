import * as Minio from 'minio';

const rawEndpoint = process.env.S3_ENDPOINT || 'http://localhost:9000';

let endpoint = 'localhost';
let port = 9000;
let useSSL = false;

try {
  // Tentar parsear como URL completa (ex: http://localhost:9000)
  const url = new URL(rawEndpoint);
  endpoint = url.hostname;
  port = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);
  useSSL = url.protocol === 'https:';
} catch (e) {
  // Fallback se não for URL válida (ex: endpoint antigo sem protocolo)
  endpoint = rawEndpoint.replace(/^https?:\/\//, '').split(':')[0];
  port = 9000;
  useSSL = false;
}

const s3Client = new Minio.Client({
  endPoint: endpoint,
  port,
  useSSL,
  accessKey: process.env.S3_ACCESS_KEY || process.env.S3_ACCESS_KEY_ID || '',
  secretKey: process.env.S3_SECRET_KEY || process.env.S3_SECRET_ACCESS_KEY || '',
});

const BUCKET_NAME = process.env.S3_BUCKET || 'premio-destaque';

/**
 * Ensures the bucket exists, creating it if necessary
 */
export async function ensureBucket() {
  const exists = await s3Client.bucketExists(BUCKET_NAME);
  if (!exists) {
    await s3Client.makeBucket(BUCKET_NAME, process.env.S3_REGION || 'us-east-1');
  }

  // Always ensure bucket policy is public for simplicity in this POC
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
      },
    ],
  };

  try {
    await s3Client.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
  } catch (error) {
    console.error('Error setting bucket policy:', error);
  }
}

/**
 * Gets a client configured for the public URL to generate valid browser signatures
 */
function getPublicS3Client() {
  if (!process.env.S3_PUBLIC_URL) return s3Client;

  try {
    const pubUrl = new URL(process.env.S3_PUBLIC_URL);
    return new Minio.Client({
      endPoint: pubUrl.hostname,
      port: parseInt(pubUrl.port) || (pubUrl.protocol === 'https:' ? 443 : 80),
      useSSL: pubUrl.protocol === 'https:',
      accessKey: process.env.S3_ACCESS_KEY || process.env.S3_ACCESS_KEY_ID || '',
      secretKey: process.env.S3_SECRET_KEY || process.env.S3_SECRET_ACCESS_KEY || '',
    });
  } catch (e) {
    console.warn("[MinIO] S3_PUBLIC_URL inválida, usando client padrão para assinaturas.");
    return s3Client;
  }
}

/**
 * Generates a presigned URL for uploading a file directly to S3/MinIO
 */
export async function generatePresignedUrl(
  fileName: string,
  fileType: string,
  organizationId: string
) {
  await ensureBucket();

  const timestamp = Date.now();
  const safeName = fileName.replace(/[^a-zA-Z0-9.]/g, '_');
  const objectName = `${organizationId}/logos/${timestamp}-${safeName}`;

  // Usar o public client garante que a assinatura SHA256 (Host Header) 
  // gerada corresponda ao S3_PUBLIC_URL que o navegador usará.
  const publicClient = getPublicS3Client();
  const uploadUrl = await publicClient.presignedPutObject(BUCKET_NAME, objectName, 5 * 60);

  // Construct the public URL
  let publicUrl = '';

  if (process.env.S3_PUBLIC_URL) {
    publicUrl = `${process.env.S3_PUBLIC_URL}/${BUCKET_NAME}/${objectName}`;
  } else {
    // Fallback using endpoint
    const protocol = useSSL ? 'https' : 'http';
    const portSuffix = (port === 80 || port === 443) ? '' : `:${port}`;
    publicUrl = `${protocol}://${endpoint}${portSuffix}/${BUCKET_NAME}/${objectName}`;
  }

  return {
    uploadUrl,
    publicUrl,
    objectName
  };
}

export { s3Client };
