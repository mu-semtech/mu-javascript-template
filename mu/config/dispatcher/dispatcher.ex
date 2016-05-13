defmodule Dispatcher do
  use Plug.Router

  def start(_argv) do
    port = 80
    IO.puts "Starting Plug with Cowboy on port #{port}"
    Plug.Adapters.Cowboy.http __MODULE__, [], port: port
    :timer.sleep(:infinity)
  end

  plug Plug.Logger
  plug :match
  plug :dispatch

  match "/catalogs/*path" do
    Proxy.forward conn, path, "http://resource/catalogs/"
  end

  match "/datasets/*path" do
    Proxy.forward conn, path, "http://resource/datasets/"
  end

  match "/themes/*path" do
    Proxy.forward conn, path, "http://resource/themes/"
  end

  match "/distributions/*path" do
    Proxy.forward conn, path, "http://resource/distributions/"
  end

  match "/catalog-records/*path" do
    Proxy.forward conn, path, "http://resource/catalog-records/"
  end

  match "/concepts/*path" do
    Proxy.forward conn, path, "http://resource/concepts/"
  end

  match "/concept-schemes/*path" do
    Proxy.forward conn, path, "http://resource/concept-schemes/"
  end

  match "/agents/*path" do
    Proxy.forward conn, path, "http://resource/agents/"
  end

  match "/template/*path" do
    Proxy.forward conn, path, "http://template:3000/"
  end

  match _ do
    send_resp( conn, 404, "Route not found" )
  end

  IO.puts "Loading new dispatcher"

end
