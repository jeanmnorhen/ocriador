// image-loader.ts
interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudflareR2Loader({ src, width, quality }: ImageLoaderProps): string {
  // Substitua pela URL pública do seu bucket R2.
  // O formato padrão é: https://<ACCOUNT_ID>.r2.cloudflarestorage.com/<BUCKET_NAME>
  const r2BucketUrl = 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com/<BUCKET_NAME>';

  // O parâmetro 'src' é o caminho da imagem solicitado no componente <Image>.
  // ex: /sprites/character.png
  // Precisamos garantir que não haja barras duplas.
  const imageUrl = `${r2BucketUrl}${src.startsWith('/') ? '' : '/'}${src}`;

  // O Cloudflare Image Resizing pode ser usado aqui adicionando parâmetros de consulta.
  // Este exemplo apenas retorna a URL direta.
  // Se você habilitar o Image Resizing em seu bucket R2, poderá anexar parâmetros como:
  // const params = new URLSearchParams();
  // params.append('width', width.toString());
  // params.append('quality', (quality || 75).toString());
  // return `${imageUrl}?${params.toString()}`;

  return imageUrl;
}
