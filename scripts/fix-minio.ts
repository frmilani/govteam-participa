import * as Minio from 'minio';

// Use env vars from process.env (passed via command line or established in shell)
const rawEndpoint = process.env.S3_ENDPOINT || 'http://localhost:9000';
const accessKey = process.env.S3_ACCESS_KEY || 'minioadmin';
const secretKey = process.env.S3_SECRET_KEY || 'minioadmin';
const BUCKET_NAME = process.env.S3_BUCKET || 'premio-destaque';
const region = process.env.S3_REGION || 'us-east-1';

async function checkMinio() {
    console.log('🔍 Verificando MinIO...');
    console.log(`Endpoint: ${rawEndpoint}`);
    console.log(`Bucket: ${BUCKET_NAME}`);

    let endpoint = 'localhost';
    let port = 9000;
    let useSSL = false;

    try {
        const url = new URL(rawEndpoint);
        endpoint = url.hostname;
        port = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);
        useSSL = url.protocol === 'https:';
    } catch (e) {
        endpoint = rawEndpoint.replace(/^https?:\/\//, '').split(':')[0];
    }

    const s3Client = new Minio.Client({
        endPoint: endpoint,
        port,
        useSSL,
        accessKey: accessKey,
        secretKey: secretKey,
    });

    try {
        const exists = await s3Client.bucketExists(BUCKET_NAME);
        if (!exists) {
            console.log(`❌ Bucket "${BUCKET_NAME}" não existe. Criando...`);
            await s3Client.makeBucket(BUCKET_NAME, region);
            console.log(`✅ Bucket "${BUCKET_NAME}" criado.`);
        } else {
            console.log(`✅ Bucket "${BUCKET_NAME}" existe.`);
        }

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

        console.log('⚙️ Aplicando política de acesso público...');
        await s3Client.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
        console.log('✅ Política aplicada com sucesso.');

        console.log('\n📄 Listando objetos no bucket:');
        const objectsStream = s3Client.listObjectsV2(BUCKET_NAME, '', true);
        objectsStream.on('data', (obj) => console.log(`- ${obj.name} (${obj.size} bytes)`));
        objectsStream.on('error', (err) => console.error(err));
        objectsStream.on('end', () => console.log('🏁 Fim da listagem.'));

    } catch (error) {
        console.error('❌ Erro ao acessar MinIO:', error);
    }
}

checkMinio();
