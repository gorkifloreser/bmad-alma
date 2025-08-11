import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import type { Metadata } from "next";
import { Roboto } from 'next/font/google';
import Link from 'next/link';
import theme from '../theme';
import "./globals.css";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "Alma App",
  description: "Regenerative Marketing Ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    Alma
                  </Link>
                </Typography>
                <Button color="inherit" component={Link} href="/login">Login</Button>
                <Button color="inherit" component={Link} href="/signup">Sign Up</Button>
              </Toolbar>
            </AppBar>
            <Box component="main" sx={{ p: 3 }}>
              {children}
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
