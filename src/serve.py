from http.server import SimpleHTTPRequestHandler, HTTPServer
import os


class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=".", **kwargs)


def run_server(port=3000):
    # Ensure the correct working directory
    os.chdir("./static")

    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, CustomHTTPRequestHandler)

    print(f"Serving on http://0.0.0.0:{port}")
    print("Press Ctrl+C to stop the server.")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
